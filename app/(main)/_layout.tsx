import { Foundation, Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#e0e0e0',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />

                       <Tabs.Screen
                name="post"
                options={{
                    title: 'post',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="add" size={size} color={color} />
                    ),
                }}
            />

                       <Tabs.Screen
                name="reels"
                options={{
                    title: 'reels',
                    tabBarIcon: ({ color, size }) => (
                        <Foundation name="play-video" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>

        

    );
}