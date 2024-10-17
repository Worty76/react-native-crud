import Button from "@/components/Button";
import axios from "axios";
import { useState } from "react";
import { Text, View, StyleSheet, TextInput, Platform } from "react-native";
import Auth from "../helper/Auth";

var baseURL = `http://localhost:8000`;
if (Platform.OS === "android") {
  baseURL = "http://10.0.2.2:8000";
}

if (Platform.OS === "ios") {
  baseURL = "http://192.168.110.226:8000";
}

export default function SignIn({ navigation }: { navigation: any }) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  const validateForm = (): boolean => {
    let errors: { [key: string]: string } = {};

    if (!username) errors.username = "username is required.";

    if (!password) errors.password = "password is required.";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async () => {
    validateForm();
    try {
      if (isFormValid) {
        await axios
          .post(
            `${baseURL}/api/user/login`,
            {
              username: username,
              password: password,
            },
            {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            }
          )
          .then((data) => {
            if (data.status === 400) {
            } else {
              console.log(data);
              Auth.authenticate(data.data.token, data.data.user, () => {
                navigation.navigate("Home");
              });
            }
          });
      }
    } catch (error: any) {
      setError(error.response.data.message);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text>Username: </Text>
          <TextInput
            style={styles.input}
            onChangeText={setUsername}
            value={username}
          />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text>Password: </Text>
          <TextInput
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            secureTextEntry
          />
        </View>
        <View>
          {Object.values(errors).map((error: any, index) => (
            <Text key={index} style={styles.error}>
              {error}
            </Text>
          ))}
        </View>
        <Text style={styles.error}>{error}</Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Button onPress={handleSignIn} title="Submit" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 5,
    borderWidth: 1,
    padding: 10,
    width: 200,
  },
  error: {
    textAlign: "center",
    color: "red",
  },
});
