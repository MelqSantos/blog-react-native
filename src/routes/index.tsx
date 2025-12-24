import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import Login from '../screens/Login';
import PostsScreen from '../screens/Home';
import ProfessoresScreen from '../screens/Professores';

const Stack = createNativeStackNavigator();

export function Routes() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={PostsScreen} />
        <Stack.Screen name="Posts" component={PostsScreen} />
        <Stack.Screen name="Professores" component={ProfessoresScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}