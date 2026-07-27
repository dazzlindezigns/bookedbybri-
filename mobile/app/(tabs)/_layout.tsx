import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'

type IconName = React.ComponentProps<typeof Ionicons>['name']

function TabIcon({ name, nameOutline, color, focused }: {
  name: IconName; nameOutline: IconName; color: string; focused: boolean
}) {
  return <Ionicons name={focused ? name : nameOutline} size={22} color={color} />
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.pink,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        tabBarStyle: {
          backgroundColor: Colors.dark,
          borderTopColor: 'rgba(255,255,255,0.1)',
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" nameOutline="home-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="calendar" nameOutline="calendar-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="people" nameOutline="people-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="phone"
        options={{
          title: 'Phone',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="call" nameOutline="call-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="ellipsis-horizontal-circle"
              nameOutline="ellipsis-horizontal-circle-outline"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      {/* Navigable but hidden from tab bar */}
      <Tabs.Screen name="requests" options={{ href: null }} />
      <Tabs.Screen name="services" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  )
}
