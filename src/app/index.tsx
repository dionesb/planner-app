import { useEffect, useState } from "react";
import { router } from "expo-router";
import { View, Text, Image, Keyboard, Alert } from "react-native";

import {
    MapPin,
    Calendar as IconCalendar,
    Settings2,
    UserRoundPlus,
    ArrowRight,
    AtSign,
} from "lucide-react-native";

import { DateData } from "react-native-calendars";
import dayjs from "dayjs";

// Server
import { tripServer } from "@/server/trip-server";

// Utils
import { validateInput } from "@/utils/validateInput";
import { calendarUtils, DatesSelected } from "@/utils/calendarUtils";

// Storage
import { tripStorage } from "@/storage/trips";

// Styles
import { colors } from "@/styles/colors";

// Components
import Input from "@/components/Input";
import Button from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Calendar } from "@/components/Calendar";
import { GuestEmail } from "@/components/Email";
import Loading from "@/components/Loading";

enum StepForm {
    TRIP_DETAIS = 1,
    ADD_EMAIL = 2,
}

enum MODAL {
    NONE = 0,
    CALENDAR = 1,
    GUESTS = 2
}

const Index = () => {
    // DATA
    const [stepForm, setStepForm] = useState(StepForm.TRIP_DETAIS);
    const [selectedDates, setSelectedDates] = useState({} as DatesSelected);
    const [destination, setDestination] = useState("");
    const [emailToInvite, setEmailToInvite] = useState("");
    const [emailsToInvites, setEmailsToInvite] = useState<string[]>([]);

    // MODAL
    const [showModal, setShowModal] = useState(MODAL.NONE);

    // LOADING
    const [isCreatingTrip, setIsCreatingTrip] = useState(false);
    const [isGettingTrip, setIsGettingTrip] = useState(true);

    const handleNextStepForm = () => {
        if (
            destination.trim().length === 0 ||
            !selectedDates.startsAt ||
            !selectedDates.endsAt
        ) {
            return Alert.alert(
                "Detalhes da viagem",
                "Preencha todas as informações da viagem para seguir."
            );
        }

        if (destination.length < 4) {
            return Alert.alert(
                "Detalhes da viagem",
                "O destino deve ter pelo menos 4 caracteres."
            );
        }

        if (stepForm === StepForm.TRIP_DETAIS) {
            return setStepForm(StepForm.ADD_EMAIL);
        }

        Alert.alert("Nova viagem", "Confirmar viagem?", [
            {
                text: "Não",
                style: "cancel"
            },
            {
                text: "Sim",
                onPress: createTrip
            }
        ]);
    };

    const handleSelectedDate = (selectedDay: DateData) => {
        const dates = calendarUtils.orderStartsAtAndEndsAt({
            startsAt: selectedDates.startsAt,
            endsAt: selectedDates.endsAt,
            selectedDay,
        });

        setSelectedDates(dates);
    };

    const handleRemoveEmail = (emailToRemove: string) => {
        setEmailsToInvite((prevState) =>
            prevState.filter((email) => email !== emailToRemove)
        );
    };

    const handleAddEmail = () => {
        if (!validateInput.email(emailToInvite)) {
            return Alert.alert("Convidado", "E-mail inválido!");
        }

        const emailAlreadyExists = emailsToInvites.find(
            (email) => email === emailToInvite
        );

        if (emailAlreadyExists) {
            return Alert.alert("Convidado", "E-mail já foi adicionado!");
        }

        setEmailsToInvite((prevState) => [...prevState, emailToInvite]);
        setEmailToInvite("");
    };

    const saveTrip = async (tripId: string) => {
        try {
            await tripStorage.save(tripId);

            router.navigate(`/trip/${tripId}`);
        } catch (error) {
            Alert.alert("Salvar viagem", "Erro ao salvar viagem.");
            console.log(error);
        }
    }

    const createTrip = async () => {
        setIsCreatingTrip(true);

        try {
            const newTrip = await tripServer.create({
                destination,
                starts_at: dayjs(selectedDates.startsAt?.dateString).toString(),
                ends_at: dayjs(selectedDates.endsAt?.dateString).toString(),
                emails_to_invite: emailsToInvites
            });

            Alert.alert("Nova viagem", "Viagem criada com sucesso!.", [
                {
                    text: "OK. Continuar",
                    onPress: () => saveTrip(newTrip.tripId)
                }
            ]);
        } catch (error) {
            Alert.alert("Salvar viagem", "Erro ao salvar viagem.");
            console.log(error);
        } finally {
            setIsCreatingTrip(false);
        }
    }

    const renderStepAddEmail = () =>
        stepForm === StepForm.ADD_EMAIL && (
            <>
                <View className="border-b py-3 border-zinc-800">
                    <Button
                        variant="secondary"
                        onPress={() => setStepForm(StepForm.TRIP_DETAIS)}
                    >
                        <Button.Text>Alterar local/data</Button.Text>
                        <Settings2 color={colors.zinc[200]} size={20} />
                    </Button>
                </View>
                <Input variant="primary">
                    <UserRoundPlus color={colors.zinc[400]} size={20} />
                    <Input.Field
                        placeholder="Quem estará na viagem?"
                        autoCorrect={false}
                        showSoftInputOnFocus={false}
                        onPress={() => {
                            Keyboard.dismiss();
                            setShowModal(MODAL.GUESTS)
                        }}
                        value={
                            emailsToInvites.length > 0
                                ? `${emailsToInvites.length} pessoa(s) convidada(s)`
                                : ""
                        }
                    />
                </Input>
            </>
        );

    const renderButtonText = () =>
        stepForm === StepForm.TRIP_DETAIS ? "Continuar" : "Confirmar Viagem";

    const renderEmailToEnvitesList = () =>
        emailsToInvites.length > 0 ? (
            emailsToInvites.map((email) => (
                <GuestEmail
                    key={email}
                    email={email}
                    onRemove={() => handleRemoveEmail(email)}
                />
            ))
        ) : (
            <Text className="text-zinc-600 text-base font-regular">
                Nenhum e-mail adicionado.
            </Text>
        );

    const getTrip = async () => {
        try {
            const tripId = await tripStorage.get();

            if (!tripId) {
                return setIsGettingTrip(false);
            }

            const trip = await tripServer.getById(tripId);

            if (trip) {
                return router.navigate("/trip/" + trip.id);
            }
        } catch (error) {
            setIsGettingTrip(false);
            console.log(error);
        }
    }

    useEffect(() => {
        getTrip();
    }, []);

    if (isGettingTrip) {
        return <Loading />
    }

    return (
        <View className="flex-1 justify-center items-center px-5">
            <Image
                source={require("@/assets/logo.png")}
                className="h-8"
                resizeMode="contain"
            />
            <Image source={require("@/assets/bg.png")} className="absolute" />
            <Text className="color-zinc-400 font-relgular text-center text-lg mt-3">
                Convide seus amigos e planeja sua{"\n"}próxima viajem
            </Text>
            <View className="w-full bg-zinc-900 p-4 rounded-xl my-8 border border-zinc-800">
                <Input variant="primary">
                    <MapPin color={colors.zinc[400]} size={20} />
                    <Input.Field
                        placeholder="Para onde?"
                        editable={stepForm === StepForm.TRIP_DETAIS}
                        onChangeText={setDestination}
                        value={destination}
                    />
                </Input>
                <Input variant="primary">
                    <IconCalendar color={colors.zinc[400]} size={20} />
                    <Input.Field
                        placeholder="Quando?"
                        editable={stepForm === StepForm.TRIP_DETAIS}
                        onFocus={() => Keyboard.dismiss()}
                        showSoftInputOnFocus={false}
                        onPress={() =>
                            stepForm === StepForm.TRIP_DETAIS && setShowModal(MODAL.CALENDAR)
                        }
                        value={selectedDates.formatDatesInText}
                    />
                </Input>
                {renderStepAddEmail()}
                <Button onPress={handleNextStepForm} isLoading={isCreatingTrip}>
                    <Button.Text>{renderButtonText()}</Button.Text>
                    <ArrowRight color={colors.lime[950]} size={20} />
                </Button>
            </View>
            <Text className="text-zinc-500 font-regular text-center text-base">
                Ao planejar sua viagem pela plann.er você automaticamente concorda com
                nossos{" "}
                <Text className="text-zinc-300 underline">
                    termos de uso e políticas de privacidade.
                </Text>
            </Text>
            <Modal
                title="Selecionar datas"
                subtitle="Selecionar data de ida e volta da viagem"
                visible={showModal === MODAL.CALENDAR}
                onClose={() => setShowModal(MODAL.NONE)}
            >
                <View className="gap-4 mt-4">
                    <Calendar
                        minDate={dayjs().toISOString()}
                        onDayPress={handleSelectedDate}
                        markedDates={selectedDates.dates}
                    />
                    <Button onPress={() => setShowModal(MODAL.NONE)}>
                        <Button.Text>Confirmar</Button.Text>
                    </Button>
                </View>
            </Modal>
            <Modal
                title="Selecionar convidados"
                subtitle="Os convidados irão receber e-mails para confirmar a participação na viagem."
                visible={showModal === MODAL.GUESTS}
                onClose={() => setShowModal(MODAL.NONE)}
            >
                <View className="my-2 flex-wrap gap-2 border-b border-zinc-800 py-5 items-start">
                    {renderEmailToEnvitesList()}
                </View>
                <View className="gap-4 mt-4">
                    <Input variant="secondary">
                        <AtSign color={colors.zinc[400]} size={20} />
                        <Input.Field
                            placeholder="Digite o e-mail do convidado"
                            keyboardType="email-address"
                            onChangeText={(text) =>
                                setEmailToInvite(text.toLocaleLowerCase())
                            }
                            value={emailToInvite}
                            returnKeyType="send"
                            onSubmitEditing={handleAddEmail}
                        />
                    </Input>

                    <Button onPress={handleAddEmail}>
                        <Button.Text>Convidar</Button.Text>
                    </Button>
                </View>
            </Modal>
        </View>
    );
};

export default Index;
