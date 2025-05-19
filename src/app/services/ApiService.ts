export default class ApiService {
    static BASE_URL = process.env.NEXT_PUBLIC_DEV ? process.env.NEXT_PUBLIC_API_URL : "https://api.tasknet.tech";

    //This function checks whether there is an active cookie session to login with and then will log you in if you do
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

    //This funciton will logout the user from the session of view
    static async logout(): Promise<void> {
        try {
            await fetch(`${ApiService.BASE_URL}/auth/logout`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: "include",
                mode: "cors"
            });
        } catch (error) {
            console.error(error);
        }
    }

    //This will log the user in and update the session to show this
    static async login(idToken: string): Promise<void> {
        try {
            const result = await fetch(`${ApiService.BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${idToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: "include",
                mode: "cors"
            });

            if (!result.ok && result.status == 401) {
                console.error({status: 401, message: "invalid-token"});
            }
        } catch (error) {
            console.error(error);
        }
    }
}
