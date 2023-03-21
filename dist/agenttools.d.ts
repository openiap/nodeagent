export declare class agenttools {
    static AddRequestToken(url: string): Promise<string[]>;
    static WaitForToken(url: string, tokenkey: string): Promise<string>;
    static get(url: string): Promise<string>;
    static post(jwt: string, agent: any, url: string, body: any): Promise<string>;
}
