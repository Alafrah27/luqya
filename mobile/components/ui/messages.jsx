import { View, Text, Image } from 'react-native';
import dayjs from 'dayjs';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/Store';

export const RenderItem = ({ item }) => {
    const { user } = useAuthStore();
    const isMe = item.sender._id === user?._id;

    return (
        <View style={{
            flexDirection: 'column',
            alignItems: isMe ? 'flex-end' : 'flex-start',
            marginVertical: 4,
            paddingHorizontal: 12,
        }}>
            {/* Bubble Container */}
            <View style={{
                maxWidth: '80%',
                backgroundColor: isMe ? '#b88144' : '#f0f0f0',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                borderBottomLeftRadius: isMe ? 16 : 4, // Tail for receiver
                borderBottomRightRadius: isMe ? 4 : 16, // Tail for sender
                elevation: 1, // Subtle shadow for Android
                shadowColor: '#000', // Subtle shadow for iOS
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 1,
            }}>
                {/* Image Handling */}
                {item.file?.fileType === 'image' && (
                    <Image
                        source={{ uri: item.file.url }}
                        style={{ width: 200, height: 200, borderRadius: 12, marginBottom: 4 }}
                        resizeMode="cover"
                    />
                )}

                {/* Message Text */}
                {item.text ? (
                    
                    <Text
                     className="font-semibold text-md text-slate-700"
                     style={{
                        color: isMe ? 'white' : '#334155',
                       
                        lineHeight: 20,
                    }}>
                        {item.text}
                    </Text>
                ) : null}

                {/* Info Row (Time + Status) */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    alignSelf: 'flex-end',
                    marginTop: 2,
                }}>
                    <Text style={{
                        fontSize: 10,
                        color: isMe ? 'rgba(255,255,255,0.7)' : '#999',
                        marginRight: 4
                    }}>
                        {dayjs(item.createdAt).format('hh:mm A')}
                    </Text>

                    {isMe && (
                        <Ionicons
                            name={item.status === 'seen' ? "checkmark-done" : "checkmark"}
                            size={14}
                            color={item.status === 'seen' ? "#4fc3f7" : "rgba(255,255,255,0.7)"}
                        />
                    )}
                </View>
            </View>
        </View>
    );
}