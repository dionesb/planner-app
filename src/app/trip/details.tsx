import { useEffect, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";
import { TripData } from "./[id]";
import { Plus } from "lucide-react-native";

// Styles
import { colors } from "@/styles/colors";

// Utils
import { validateInput } from "@/utils/validateInput";

// Server
import { linksServer } from "@/server/links-server";
import { participantsServer } from "@/server/participants-server";

// Components
import Button from "@/components/Button";
import { Modal } from "@/components/Modal";
import Input from "@/components/Input";
import { TripLink, TripLinkProps } from "@/components/TripLink";
import { Participant, ParticipantProps } from "@/components/Participant";

interface IDetailsProps {
    tripId: string;
}

export const Details: React.FC<IDetailsProps> = ({ tripId }) => {
    // MODAL
    const [showNewLinkModal, setShowNewLinkModal] = useState(false);

    // LOADING
    const [isCreatingLinkTrip, setIsCreatingLinkTrip] = useState(false);
    const [isLoadingLinksTrip, setIsLoadingLinksTrip] = useState(true);
    const [isLoadingParticipantsTrip, setIsLoadingParticipantsTrip] = useState(true);

    // DATA
    const [linkTitle, setLinkTitle] = useState("");
    const [linkURL, setLinkURL] = useState("");
    const [linksTrip, setLinksTrip] = useState<TripLinkProps[]>([]);
    const [participantsTrip, setParticipantsTrip] = useState<ParticipantProps[]>([]);

    const resetNewLinkFields = () => {
        setLinkTitle("");
        setLinkURL("");
        setShowNewLinkModal(false);
    };

    const handleCreateLinkTrip = async () => {
        try {
            if (!linkTitle.trim()) {
                return Alert.alert("Link", "Informe o nome do link.");
            }

            if (!validateInput.url(linkURL.trim())) {
                return Alert.alert("Link", "Link inválido!");
            }

            setIsCreatingLinkTrip(true);

            await linksServer.create({
                tripId,
                title: linkTitle,
                url: linkURL,
            });

            Alert.alert("Link", "Link criado com sucesso.");

            resetNewLinkFields();

            getTripLinks();
        } catch (error) {
            console.log(error);
        } finally {
            setIsCreatingLinkTrip(false);
        }
    };

    const getTripLinks = async () => {
        try {
            setIsLoadingLinksTrip(true);

            const links = await linksServer.getLinksByTripId(tripId);

            setLinksTrip(links);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoadingLinksTrip(false);
        }
    };

    const getTripParticipants = async () => {
        try {
            setIsLoadingParticipantsTrip(true);

            const participants = await participantsServer.getByTripId(tripId);

            setParticipantsTrip(participants);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoadingParticipantsTrip(false);
        }
    };

    useEffect(() => {
        getTripLinks();
        getTripParticipants();
    }, []);

    const renderLinksList = () => !!linksTrip.length ? (
        <FlatList
            data={linksTrip}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TripLink key={item.id} data={item} />}
            contentContainerClassName="gap-4"
        />
    ) : (
        <Text className="text-zinc-400 font-regular text-base mt-2 mb-6">Nenhum link adicionado</Text>
    )

    return (
        <View className="flex-1 mt-10">
            <View className="flex-1">
                <Text className="text-zinc-50 text-2xl font-semibold mb-2">
                    Links importantes
                </Text>
                {renderLinksList()}
                <Button variant="secondary" onPress={() => setShowNewLinkModal(true)}>
                    <Plus color={colors.zinc[200]} size={20} />
                    <Button.Text>Cadastrar novo link</Button.Text>
                </Button>
            </View>
            <View className="flex-1 border-t border-zinc-800 mt-6">
                <Text className="text-zinc-50 text-2xl font-semibold my-6">
                    Convidados
                </Text>
                <FlatList
                    data={participantsTrip}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <Participant key={item.id} data={item} />}
                    contentContainerClassName="gap-4 pb-44"
                />
            </View>
            <Modal
                title="Cadastrar link"
                subtitle="Todos os convidados podem visualizar os links importantes."
                visible={showNewLinkModal}
                onClose={() => setShowNewLinkModal(false)}
            >
                <View className="gap-2 mb-3">
                    <Input variant="secondary">
                        <Input.Field
                            placeholder="Título do link"
                            onChangeText={setLinkTitle}
                        />
                    </Input>
                    <Input variant="secondary">
                        <Input.Field placeholder="URL" onChangeText={setLinkURL} />
                    </Input>
                </View>
                <Button isLoading={isCreatingLinkTrip} onPress={handleCreateLinkTrip}>
                    <Button.Text>Salvar link</Button.Text>
                </Button>
            </Modal>
        </View>
    );
};
