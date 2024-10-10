import Button from "@/components/Button";
import { Text, View, StyleSheet } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";

type RootStackParamList = {
  SignUp: { name: string };
};

type NavigationProps = StackNavigationProp<RootStackParamList, "SignUp">;

interface IndexProps {
  navigation: NavigationProps;
}

export default function Index({ navigation }: IndexProps) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <View style={{ paddingHorizontal: 2 }}>
          <Button
            title="Sign in"
            onPress={() => navigation.navigate("SignIn")}
          />
        </View>
        <View style={{ paddingHorizontal: 2 }}>
          <Button
            title="Sign up"
            onPress={() => navigation.navigate("SignUp")}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
