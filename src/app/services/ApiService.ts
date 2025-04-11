export default class ApiService {
    static BASE_URL = "http://localhost:1020";

    static async sessionExists(): Promise<{presence: boolean, customToken?: string}> {
        try {
            const result = await fetch(`${ApiService.BASE_URL}/auth/session`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: "include",
                mode: "cors"
            });

            const { presence, customToken } = await result.json();

            return { presence, customToken };
        } catch (error) {
            console.error(error);
            return { presence: false };
        }
    }

    static login(idToken: string): void {
        // TODO: add error handling

        fetch(`${ApiService.BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${idToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: "include",
            mode: "cors"
        });
    }

    // static admin(): void {
    //     fetch(`${ApiService.BASE_URL}/admin`, {
    //         method: "GET",
    //         headers: {
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json',
    //         },
    //         credentials: "include"
    //     });
    // }
}
