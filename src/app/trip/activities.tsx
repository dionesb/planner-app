import { useEffect, useState } from "react";
import { Alert, Keyboard, SectionList, Text, View } from "react-native";
import {
    Clock,
    Calendar as IconCalendar,
    PlusIcon,
    Tag,
} from "lucide-react-native";
import dayjs from "dayjs";
import { TripData } from "./[id]";

// Service
import { activitiesServer } from "@/server/activities-server";

// Styles
import { colors } from "@/styles/colors";

// Components
import Button from "@/components/Button";
import { Modal } from "@/components/Modal";
import Input from "@/components/Input";
import { Calendar } from "@/components/Calendar";
import { Activity, ActivityProps } from "@/components/Activity";
import Loading from "@/components/Loading";

interface IActivitiesProps {
    tripDetails: TripData;
}

enum MODAL {
    NONE = 0,
    CALENDAR = 1,
    NEW_ACTIVITY = 2,
}

type TripActivities = {
    title: {
        dayNumber: number;
        dayName: string;
    };
    data: ActivityProps[];
};

export const Activities: React.FC<IActivitiesProps> = ({ tripDetails }) => {
    // MODAL
    const [showModal, setShowModal] = useState(MODAL.NONE);

    // LOADING
    const [isCreatingActivity, setIsCreatingActivity] = useState(false);
    const [isLoadingActivities, setIsLoadingActivities] = useState(true);

    // DATA
    const [activityTitle, setActivityTitle] = useState("");
    const [activityDate, setActivityDate] = useState("");
    const [activityHour, setActivityHour] = useState("");

    // LIST
    const [tripActivities, setTripActivities] = useState<TripActivities[]>([]);

    const resetNewActivityFields = () => {
        setActivityDate("");
        setActivityTitle("");
        setActivityHour("");
        setShowModal(MODAL.NONE);
    };

    const handleCreateTripActivity = async () => {
        try {
            if (!activityTitle || !activityHour || !activityDate) {
                return Alert.alert("Cadastrar atividade", "Preencha todos os campos!");
            }

            setIsCreatingActivity(true);

            await activitiesServer.create({
                tripId: tripDetails.id,
                occurs_at: dayjs(activityDate)
                    .add(Number(activityHour), "h")
                    .toString(),
                title: activityTitle,
            });

            Alert.alert("Nova atividade", "Nova atividade cadastrada com sucesso!");

            await getTripActivities();

            resetNewActivityFields();
        } catch (error) {
            console.log(error);
        } finally {
            setIsCreatingActivity(false);
        }
    };

    const getTripActivities = async () => {
        try {
            setIsLoadingActivities(true);

            const activities = await activitiesServer.getActivitiesByTripId(
                tripDetails.id
            );

            const activitiesToSectionList = activities.map((dayActivity) => ({
                title: {
                    dayNumber: dayjs(dayActivity.date).date(),
                    dayName: dayjs(dayActivity.date).format("dddd").replace("-feira", ""),
                },
                data: dayActivity.activities.map((activity) => ({
                    id: activity.id,
                    title: activity.title,
                    hour: dayjs(activity.occurs_at).format("hh[:]mm[h]"),
                    isBefore: dayjs(activity.occurs_at).isBefore(dayjs()),
                })),
            }));

            setTripActivities(activitiesToSectionList);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoadingActivities(false);
        }
    };

    useEffect(() => {
        getTripActivities();
    }, []);

    const renderSectionList = () =>
        isLoadingActivities ? (
            <Loading />
        ) : (
            <SectionList
                sections={tripActivities}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <Activity data={item} />}
                renderSectionHeader={({ section }) => (
                    <View className="w-full">
                        <Text className="text-zinc-50 text-2xl font-semibold py-2">
                            Dia {section.title.dayNumber + " "}
                            <Text className="text-zinc-500 text-base font-regular capitalize">
                                {section.title.dayName}
                            </Text>
                        </Text>
                        {section.data.length === 0 && (
                            <Text className="text-zinc-500 font-regular text-sm mb-8">
                                Nenhuma atividade cadastrada nessa data.
                            </Text>
                        )}
                    </View>
                )}
                contentContainerClassName="gap-3 pb-48"
                showsVerticalScrollIndicator={false}
            />
        );

    return (
        <View className="flex-1">
            <View className="w-full flex-row mt-5 mb-6 items-center">
                <Text className="text-zinc-50 text-2xl font-semibold flex-1">
                    Atividades
                </Text>
                <Button onPress={() => setShowModal(MODAL.NEW_ACTIVITY)}>
                    <PlusIcon color={colors.lime[950]} size={20} />
                    <Button.Text>Nova Atividade</Button.Text>
                </Button>
            </View>
            {renderSectionList()}
            <Modal
                title="Cadastrar atividade"
                subtitle="Todos os convidados podem visualizar as atividades"
                visible={showModal === MODAL.NEW_ACTIVITY}
                onClose={() => setShowModal(MODAL.NONE)}
            >
                <View className="mt-4 mb-3">
                    <Input variant="secondary">
                        <Tag color={colors.zinc[400]} size={20} />
                        <Input.Field
                            placeholder="Qual a atividade?"
                            onChangeText={setActivityTitle}
                            value={activityTitle}
                        />
                    </Input>
                    <View className="w-full mt-2 flex-row gap-2">
                        <Input className="flex-1" variant="secondary">
                            <IconCalendar color={colors.zinc[400]} size={20} />
                            <Input.Field
                                placeholder="Data"
                                onChangeText={setActivityTitle}
                                value={
                                    activityDate ? dayjs(activityDate).format("DD [de] MMMM") : ""
                                }
                                onFocus={() => Keyboard.dismiss()}
                                showSoftInputOnFocus={false}
                                onPress={() => setShowModal(MODAL.CALENDAR)}
                            />
                        </Input>
                        <Input className="flex-1" variant="secondary">
                            <Clock color={colors.zinc[400]} size={20} />
                            <Input.Field
                                placeholder="Horário?"
                                onChangeText={(text) =>
                                    setActivityHour(text.replace(".", "").replace(",", ""))
                                }
                                value={activityHour}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                        </Input>
                    </View>
                </View>
                <Button onPress={handleCreateTripActivity}>
                    <Button.Text>Salvar atividade</Button.Text>
                </Button>
            </Modal>
            <Modal
                title="Selecionar data"
                subtitle="Seleciona a data da atividade"
                visible={showModal === MODAL.CALENDAR}
                onClose={() => setShowModal(MODAL.NEW_ACTIVITY)}
            >
                <View className="gap-4 mt-4">
                    <Calendar
                        onDayPress={(day) => setActivityDate(day.dateString)}
                        markedDates={{ [activityDate]: { selected: true } }}
                        initialDate={tripDetails.starts_at.toString()}
                        minDate={tripDetails.starts_at.toString()}
                        maxDate={tripDetails.ends_at.toString()}
                    />
                    <Button onPress={() => setShowModal(MODAL.NEW_ACTIVITY)}>
                        <Button.Text>Confirmar</Button.Text>
                    </Button>
                </View>
            </Modal>
        </View>
    );
};
