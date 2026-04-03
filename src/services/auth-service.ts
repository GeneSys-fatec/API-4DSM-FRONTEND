const API_URL = 'http://localhost:3333';

export interface LoginPayload {
    email: string;
    password: string;
}

export const authService = {
    login: async (data: LoginPayload): Promise<string> => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");
        const responseData = isJson ? await response.json() : await response.text();

        if (!response.ok) {
            throw new Error(isJson ? responseData.error : "Erro ao realizar login");
        }

        return responseData;
    }
};