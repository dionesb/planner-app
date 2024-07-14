import { api } from "./api";

export type TripDetails = {
    id: string;
    destination: string;
    starts_at: string;
    ends_at: string;
    is_confirmed: boolean;
}

type TripCreate = Omit<TripDetails, "id" | "is_confirmed"> & {
    emails_to_invite: string[];
}

const getById = async (id: string) => {
    try {
        const { data } = await api.get<{ trip: TripDetails }>(`/trips/${id}`);

        return data.trip;
    } catch (error) {
        throw error;
    }
}

const create = async ({ destination, starts_at, ends_at, emails_to_invite }: TripCreate) => {
    try {
        const { data } = await api.post<{ tripId: string }>("/trips", {
            destination, 
            starts_at, 
            ends_at, 
            emails_to_invite,
            owner_name: "Diones Breda",
            owner_email: "diones.breda@gmail.com"
        });

        return data;
    } catch (error) {
        throw error;
    }
}

const update = async ({ id, destination, starts_at, ends_at }: Omit<TripDetails, "is_confirmed">) => {
    try {
        const { data } = await api.put(`/trips/${id}`, {
            destination, 
            starts_at, 
            ends_at
        });

        return data;
    } catch (error) {
        throw error;
    }
}

export const tripServer = { getById, create, update };