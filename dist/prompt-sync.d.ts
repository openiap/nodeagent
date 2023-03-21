declare var fs: any;
declare var stripAnsi: any;
declare var term: number;
/**
 * create -- sync function for reading user input from stdin
 * @param   {Object} config {
 *   sigint: {Boolean} exit on ^C
 *   autocomplete: {StringArray} function({String})
 *   history: {String} a history control object (see `prompt-sync-history`)
 * }
 * @returns {Function} prompt function
 */
declare function create(config: any): {
    (ask: any, value: any, opts: any): any;
    history: any;
    hide(ask: any): any;
};
