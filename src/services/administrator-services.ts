import { apiFetch, buildQueryString } from './api';

export interface Administrator {
    id: number;
    name: string;
    email: string;
}

export interface CreateAdminPayload {
    name: string;
    email: string;
    password?: string;
}

export interface AdministratorListFilters {
    q?: string;
    status?: string;
    from?: string;
    to?: string;
}

export const administratorService = {
    findAll: async (filters?: AdministratorListFilters): Promise<Administrator[]> => {
        try {
            const queryString = buildQueryString({
                q: filters?.q,
                status: filters?.status,
                from: filters?.from,
                to: filters?.to,
            });

            const response = await apiFetch(`/administrator${queryString}`);
            if (!response.ok) throw new Error("Erro ao buscar administradores");
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    findById: async (id: number): Promise<Administrator | null> => {
        try {
            const response = await apiFetch(`/administrator/${id}`);

            if (!response.ok) {
                throw new Error("Erro ao buscar administrador");
            }

            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar administrador:", error);
            return null;
        }
    },

    create: async (data: CreateAdminPayload): Promise<Administrator> => {
        const response = await apiFetch(`/administrator/create`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        const responseData = await response.json();
        if (!response.ok) throw new Error(responseData.error || "Erro ao criar administrador");
        return responseData;
    },

    update: async (id: number, data: Partial<CreateAdminPayload>): Promise<Administrator> => {
        const payload = {
            newName: data.name,
            newEmail: data.email,
            newPassword: data.password,
        };
        const response = await apiFetch(`/administrator/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
        const responseData = await response.json();
        if (!response.ok) throw new Error(responseData.error || "Erro ao atualizar administrador");
        return responseData;
    },

    delete: async (id: number): Promise<boolean> => {
        const response = await apiFetch(`/administrator/delete/${id}`, {
            method: 'DELETE',
            headers: {}
        });

        if (!response.ok) {
            const responseData = await response.json();
            throw new Error(responseData.error || "Erro ao deletar administrador");
        }
        return true;
    }
};