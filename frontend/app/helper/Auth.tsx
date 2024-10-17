import AsyncStorage from "@react-native-async-storage/async-storage";

const Auth = {
  async isAuthenticated() {
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");

    if (!token) return false;

    let data = {
      token: token,
      user: user ? JSON.parse(user) : null,
    };

    return data;
  },
  async authenticate(token: string, user: any, cb: any) {
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(user));
    cb();
  },
};

export default Auth;
