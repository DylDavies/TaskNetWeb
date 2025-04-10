export default class ApiService {
    static BASE_URL = "http://localhost:1020";

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