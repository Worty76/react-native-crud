import Button from "@/components/Button";
import { useState } from "react";
import axios from "axios";
import { Text, View, StyleSheet, TextInput, Platform } from "react-native";

var baseURL = `http://localhost:8000`;
if (Platform.OS === "android") {
  baseURL = "http://10.0.2.2:8000";
}

if (Platform.OS === "ios") {
  baseURL = "http://192.168.110.226:8000";
}

export default function SignUp({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [error, setError] = useState();
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  const validateForm = () => {
    let errors = {};

    if (!username) {
      errors.username = "username is required.";
    }

    if (!password) {
      errors.password = "password is required.";
    }
    if (!rePassword) {
      errors.rePassword = "repassword is required.";
    }

    if (password !== rePassword) {
      errors.isMatch = "passwords don't match";
    }

    setErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  };

  const handleSignUp = async () => {
    validateForm();
    try {
      if (isFormValid) {
        await axios
          .post(
            `${baseURL}/api/user/register`,
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
              navigation.navigate("SignIn");
            }
          });
      }
    } catch (error) {
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

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text>Re-Password: </Text>
          <TextInput
            style={styles.input}
            onChangeText={setRePassword}
            value={rePassword}
            secureTextEntry
          />
        </View>
        <View>
          {Object.values(errors).map((error, index) => (
            <Text key={index} style={styles.error}>
              {error}
            </Text>
          ))}
        </View>
        <View>{error && <Text style={styles.error}>{error}</Text>}</View>
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Button onPress={handleSignUp} title="Submit" />
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
