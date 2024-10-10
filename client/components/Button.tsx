import { Colors } from "@/constants/Colors";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const Button = (props: any) => {
  const style = props.normalText
    ? { fontWeight: "bold", fontSize: 15, fontFamily: undefined }
    : {};
  return (
    <TouchableOpacity
      style={{
        ...styles.button,
        ...props.style,
        backgroundColor: props.whiteTheme ? Colors.secondary : Colors.primary,
      }}
      onPress={props.onPress}
    >
      <Text
        style={{
          ...styles.text,
          color: props.whiteTheme ? Colors.primary : Colors.secondary,
          ...style,
          ...props.textStyle,
        }}
        numberOfLines={1}
        adjustsFontSizeToFit={true}
      >
        {props.title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.secondary,
    height: 40,
    width: 100,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: Colors.primary,
    fontSize: 17.5,
    fontFamily: "bold",
  },
});
