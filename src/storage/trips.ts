import AsyncStorage from "@react-native-async-storage/async-storage";

const TRIP_STORAGE_KEY = "@planner:tripId";

const save = async (tripId: string) => {
    try {
        await AsyncStorage.setItem(TRIP_STORAGE_KEY, tripId);
    } catch (error) {
        throw error;
    }
}

const get = async () => {
    try {
        const tripId = await AsyncStorage.getItem(TRIP_STORAGE_KEY);

        return tripId;
    } catch (error) {
        throw error;
    }
}

const remove = async () => {
    try {
        await AsyncStorage.removeItem(TRIP_STORAGE_KEY);
    } catch (error) {
        throw error;
    }
}

export const tripStorage = { save, get, remove };
