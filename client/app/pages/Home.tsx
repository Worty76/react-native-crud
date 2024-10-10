import Button from "@/components/Button";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Alert,
  Image,
  Platform,
} from "react-native";
import Auth from "../helper/Auth";
import ImagePicker from "expo-image-picker";
import { launchImageLibrary } from "react-native-image-picker";

var baseURL = `http://localhost:8000`;
if (Platform.OS === "android") {
  baseURL = "http://10.0.2.2:8000";
}

if (Platform.OS === "ios") {
  baseURL = "http://192.168.110.226:8000";
}

export default function Home({ navigation }) {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productTopic, setProductTopic] = useState("");
  const [productId, setProductId] = useState(null);
  const [user, setUser] = useState({});
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [search, setSearch] = useState("");
  const [image, setImage] = useState();

  const validateForm = () => {
    let errors = {};

    if (!productName) {
      errors.productName = "productName is required.";
    }

    if (!productPrice) {
      errors.productPrice = "productPrice is required.";
    }

    if (!productTopic) {
      errors.productTopic = "productTopic is required.";
    }

    setErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  };

  useEffect(() => {
    const getAuth = async () => {
      const user = await Auth.isAuthenticated().then((data) => {
        return data;
      });
      setUser(user);
    };

    getAuth();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/product`);
      setProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleSubmit = async () => {
    validateForm();
    try {
      if (isFormValid) {
        if (productId) {
          await axios.put(
            `${baseURL}/api/product/update/${productId}`,
            {
              name: productName,
              price: productPrice,
              topic: productTopic,
            },
            {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + user.token,
              },
            }
          );
        } else {
          const formData = new FormData();
          formData.append("name", productName);
          formData.append("price", productPrice);
          formData.append("topic", productTopic);
          formData.append("image", image);

          await axios.post(`${baseURL}/api/product/create`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: "Bearer " + user.token,
            },
          });
        }
        setProductName("");
        setProductPrice("");
        setProductTopic("");
        setProductId(null);
        fetchProducts();
      }
    } catch (error) {
      console.error("Error submitting product:", error);
    }
  };

  const handleEdit = (product) => {
    setProductName(product.name);
    setProductPrice(product.price);
    setProductTopic(product.topic);
    setProductId(product._id);
  };

  const handleDelete = async (productId) => {
    try {
      await axios.delete(`${baseURL}/api/product/delete/${productId}`, {
        headers: { Authorization: "Bearer " + user.token },
      });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleSearch = async () => {
    try {
      if (search === "") {
        fetchProducts();
        return;
      }

      await axios
        .post(
          `${baseURL}/api/product/search`,
          {
            name: search,
          },
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: "Bearer " + user.token,
            },
          }
        )
        .then((data) => {
          setProducts(data.data.data);
        });
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const selectPhotoTapped = () => {
    const options = {
      mediaType: "photo",
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("Image picker error: ", response.error);
      } else {
        let imageUri = response.assets?.[0]?.uri;
        if (imageUri) {
          setImage(imageUri);
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      {user && user.user && user.user.role === "admin" ? (
        <View>
          <View>
            <View style={styles.inputContainer}>
              <Text>Product Name:</Text>
              <TextInput
                style={styles.input}
                onChangeText={setProductName}
                value={productName}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text>Product Price:</Text>
              <TextInput
                style={styles.input}
                onChangeText={setProductPrice}
                value={productPrice}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text>Product topic:</Text>
              <TextInput
                style={styles.input}
                onChangeText={setProductTopic}
                value={productTopic}
              />
            </View>
            <View style={styles.inputContainer}>
              <Button title="Image" onPress={selectPhotoTapped} />
            </View>
            <View>
              {image && (
                <Image style={{ width: 200 }} source={{ uri: image }} />
              )}
            </View>
          </View>
          <View>
            {Object.values(errors).map((error, index) => (
              <Text key={index} style={styles.error}>
                {error}
              </Text>
            ))}
          </View>
          <View style={styles.buttonContainer}>
            <Button
              onPress={handleSubmit}
              title={productId ? "Update Product" : "Add Product"}
            />
          </View>
        </View>
      ) : (
        ""
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={setSearch}
          value={search}
        />
        <Button title="Search" onPress={handleSearch} />
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View>
                <Image
                  source={{ uri: item.image }}
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "10px",
                  }}
                />
              </View>
              <View>
                <Text>Name: {item.name}</Text>
                <Text>Price: {item.price}</Text>
                <Text>Topic: {item.topic}</Text>
              </View>
            </View>
            {user && user.user && user.user.role === "admin" ? (
              <View style={styles.productButtons}>
                <Button onPress={() => handleEdit(item)} title="Edit" />
                <Button onPress={() => handleDelete(item._id)} title="Delete" />
              </View>
            ) : (
              ""
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    height: 40,
    margin: 5,
    borderWidth: 1,
    padding: 10,
    width: 200,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  productButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  error: {
    color: "red",
    fontSize: 15,
    marginBottom: 12,
  },
  image: {
    width: 200,
    height: 200,
  },
});
