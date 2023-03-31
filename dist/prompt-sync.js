/*
from https://github.com/heapwolf/prompt-sync

The MIT License (MIT)

Copyright (c) 2014-2019 Paolo Fragomeni & David Mark Clements

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
// @ts-ignore
var fs = require('fs');
var stripAnsi = require('strip-ansi');
var term = 13; // carriage return
/**
 * create -- sync function for reading user input from stdin
 * @param   {Object} config {
 *   sigint: {Boolean} exit on ^C
 *   autocomplete: {StringArray} function({String})
 *   history: {String} a history control object (see `prompt-sync-history`)
 * }
 * @returns {Function} prompt function
 */
// for ANSI escape codes reference see https://en.wikipedia.org/wiki/ANSI_escape_code
function create(config) {
    config = config || {};
    var sigint = config.sigint;
    var eot = config.eot;
    // @ts-ignore
    var autocomplete = config.autocomplete = config.autocomplete || function () { return []; };
    var history = config.history;
    prompt.history = history || { save: function () { } };
    // @ts-ignore
    prompt.hide = function (ask) { return prompt(ask, { echo: '' }); };
    return prompt;
    /**
     * prompt -- sync function for reading user input from stdin
     *  @param {String} ask opening question/statement to prompt for
     *  @param {String} value initial value for the prompt
     *  @param   {Object} opts {
     *   echo: set to a character to be echoed, default is '*'. Use '' for no echo
     *   value: {String} initial value for the prompt
     *   ask: {String} opening question/statement to prompt for, does not override ask param
     *   autocomplete: {StringArray} function({String})
     * }
     *
     * @returns {string} Returns the string input or (if sigint === false)
     *                   null if user terminates with a ^C
     */
    function prompt(ask, value, opts) {
        var insert = 0, savedinsert = 0, res, i, savedstr;
        opts = opts || {};
        if (Object(ask) === ask) {
            opts = ask;
            ask = opts.ask;
        }
        else if (Object(value) === value) {
            opts = value;
            value = opts.value;
        }
        ask = ask || '';
        var echo = opts.echo;
        var masked = 'echo' in opts;
        autocomplete = opts.autocomplete || autocomplete;
        var fd = (process.platform === 'win32') ?
            process.stdin.fd :
            fs.openSync('/dev/tty', 'rs');
        var wasRaw = process.stdin.isRaw;
        if (!wasRaw) {
            process.stdin.setRawMode && process.stdin.setRawMode(true);
        }
        var buf = Buffer.alloc(3);
        var str = '', character, read;
        savedstr = '';
        if (ask) {
            process.stdout.write(ask);
        }
        var cycle = 0;
        var prevComplete;
        while (true) {
            read = fs.readSync(fd, buf, 0, 3);
            if (read > 1) { // received a control sequence
                switch (buf.toString()) {
                    case '\u001b[A': //up arrow
                        if (masked)
                            break;
                        if (!history)
                            break;
                        if (history.atStart())
                            break;
                        if (history.atEnd()) {
                            savedstr = str;
                            savedinsert = insert;
                        }
                        str = history.prev();
                        insert = str.length;
                        process.stdout.write('\u001b[2K\u001b[0G' + ask + str);
                        break;
                    case '\u001b[B': //down arrow
                        if (masked)
                            break;
                        if (!history)
                            break;
                        if (history.pastEnd())
                            break;
                        if (history.atPenultimate()) {
                            str = savedstr;
                            insert = savedinsert;
                            history.next();
                        }
                        else {
                            str = history.next();
                            insert = str.length;
                        }
                        process.stdout.write('\u001b[2K\u001b[0G' + ask + str + '\u001b[' + (insert + ask.length + 1) + 'G');
                        break;
                    case '\u001b[D': //left arrow
                        if (masked)
                            break;
                        var before = insert;
                        insert = (--insert < 0) ? 0 : insert;
                        if (before - insert)
                            process.stdout.write('\u001b[1D');
                        break;
                    case '\u001b[C': //right arrow
                        if (masked)
                            break;
                        insert = (++insert > str.length) ? str.length : insert;
                        process.stdout.write('\u001b[' + (insert + ask.length + 1) + 'G');
                        break;
                    default:
                        if (buf.toString()) {
                            str = str + buf.toString();
                            str = str.replace(/\0/g, '');
                            insert = str.length;
                            promptPrint(masked, ask, echo, str, insert);
                            process.stdout.write('\u001b[' + (insert + ask.length + 1) + 'G');
                            buf = Buffer.alloc(3);
                        }
                }
                continue; // any other 3 character sequence is ignored
            }
            // if it is not a control character seq, assume only one character is read
            character = buf[read - 1];
            // catch a ^C and return null
            if (character == 3) {
                process.stdout.write('^C\n');
                fs.closeSync(fd);
                if (sigint)
                    process.exit(130);
                process.stdin.setRawMode && process.stdin.setRawMode(wasRaw);
                return null;
            }
            // catch a ^D and exit
            if (character == 4) {
                if (str.length == 0 && eot) {
                    process.stdout.write('exit\n');
                    process.exit(0);
                }
            }
            // catch the terminating character
            if (character == term) {
                fs.closeSync(fd);
                if (!history)
                    break;
                if (!masked && str.length)
                    history.push(str);
                history.reset();
                break;
            }
            // catch a TAB and implement autocomplete
            if (character == 9) { // TAB
                res = autocomplete(str);
                if (str == res[0]) {
                    res = autocomplete('');
                }
                else {
                    prevComplete = res.length;
                }
                if (res.length == 0) {
                    process.stdout.write('\t');
                    continue;
                }
                var item = res[cycle++] || res[cycle = 0, cycle++];
                if (item) {
                    process.stdout.write('\r\u001b[K' + ask + item);
                    str = item;
                    insert = item.length;
                }
            }
            if (character == 127 || (process.platform == 'win32' && character == 8)) { //backspace
                if (!insert)
                    continue;
                str = str.slice(0, insert - 1) + str.slice(insert);
                insert--;
                process.stdout.write('\u001b[2D');
            }
            else {
                if ((character < 32) || (character > 126))
                    continue;
                str = str.slice(0, insert) + String.fromCharCode(character) + str.slice(insert);
                insert++;
            }
            ;
            promptPrint(masked, ask, echo, str, insert);
        }
        process.stdout.write('\n');
        process.stdin.setRawMode && process.stdin.setRawMode(wasRaw);
        return str || value || '';
    }
    ;
    function promptPrint(masked, ask, echo, str, insert) {
        if (masked) {
            process.stdout.write('\u001b[2K\u001b[0G' + ask + Array(str.length + 1).join(echo));
        }
        else {
            process.stdout.write('\u001b[s');
            if (insert == str.length) {
                process.stdout.write('\u001b[2K\u001b[0G' + ask + str);
            }
            else {
                if (ask) {
                    process.stdout.write('\u001b[2K\u001b[0G' + ask + str);
                }
                else {
                    process.stdout.write('\u001b[2K\u001b[0G' + str + '\u001b[' + (str.length - insert) + 'D');
                }
            }
            // Reposition the cursor to the right of the insertion point
            var askLength = stripAnsi(ask).length;
            process.stdout.write("\u001B[".concat(askLength + 1 + (echo == '' ? 0 : insert), "G"));
        }
    }
}
;
module.exports = create;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvbXB0LXN5bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcHJvbXB0LXN5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQXdCRTtBQUlGLGFBQWE7QUFDYixJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkIsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3RDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQjtBQUVqQzs7Ozs7Ozs7R0FRRztBQUVILHFGQUFxRjtBQUVyRixTQUFTLE1BQU0sQ0FBQyxNQUFXO0lBRXpCLE1BQU0sR0FBRyxNQUFNLElBQUksRUFBRSxDQUFDO0lBQ3RCLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDM0IsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNyQixhQUFhO0lBQ2IsSUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxJQUFJLGNBQWMsT0FBTyxFQUFFLENBQUEsQ0FBQyxDQUFDLENBQUM7SUFDMUYsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUM3QixNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsRUFBRSxDQUFDO0lBQ3RELGFBQWE7SUFDYixNQUFNLENBQUMsSUFBSSxHQUFHLFVBQVUsR0FBRyxJQUFJLE9BQU8sTUFBTSxDQUFDLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDO0lBRWxFLE9BQU8sTUFBTSxDQUFDO0lBR2Q7Ozs7Ozs7Ozs7Ozs7T0FhRztJQUdILFNBQVMsTUFBTSxDQUFDLEdBQVEsRUFBRSxLQUFVLEVBQUUsSUFBUztRQUM3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