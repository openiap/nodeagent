export async function awaittry(command: any, timeout: number): Promise<any> {
    try {
        var results: any = await Promise.race([
            command.then((result: any) => ({ success: true, result })).catch((error: any) => ({ success: false, error })),
            new Promise(resolve => setTimeout(() => resolve({ success: false, error: new Error(`Await timed out after ${timeout} seconds`) }), timeout * 1000))
        ]);
        if (!results.success) throw results.error;
        return results.result;
    } catch (error) {
        throw error;
    }
}
export async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}