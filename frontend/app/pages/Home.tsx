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
import {
  launchImageLibrary,
  ImageLibraryOptions,
} from "react-native-image-picker";

var baseURL = `http://localhost:8000`;
if (Platform.OS === "android") {
  baseURL = "http://10.0.2.2:8000";
}
if (Platform.OS === "ios") {
  baseURL = "http://192.168.110.226:8000";
}

interface Product {
  _id: string;
  name: string;
  price: string;
  topic: string;
  image: string;
}

interface User {
  user: {
    role: string;
  };
  token: string;
}

export default function Home({ navigation }: { navigation: any }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductName] = useState<string>("");
  const [productPrice, setProductPrice] = useState<string>("");
  const [productTopic, setProductTopic] = useState<string>("");
  const [productId, setProductId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [search, setSearch] = useState<string>("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  const validateForm = (): boolean => {
    let errors: { [key: string]: string } = {};

    if (!productName) errors.productName = "Product name is required.";
    if (!productPrice) errors.productPrice = "Product price is required.";
    if (!productTopic) errors.productTopic = "Product topic is required.";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const getAuth = async () => {
      const user = (await Auth.isAuthenticated()) as User;
      setUser(user);
    };

    getAuth();
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
    const isValid = validateForm();
    setIsFormValid(isValid);

    if (isValid) {
      try {
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
                Authorization: "Bearer " + user?.token,
              },
            }
          );
        } else {
          const formData = new FormData();
          formData.append("name", productName);
          formData.append("price", productPrice);
          formData.append("topic", productTopic);
          if (image) {
            formData.append("image", image);
          }

          await axios.post(`${baseURL}/api/product/create`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: "Bearer " + user?.token,
            },
          });
        }

        setProductName("");
        setProductPrice("");
        setProductTopic("");
        setProductId(null);
        setImage(undefined);
        fetchProducts();
      } catch (error) {
        console.error("Error submitting product:", error);
      }
    }
  };

  const handleEdit = (product: Product) => {
    setProductName(product.name);
    setProductPrice(product.price);
    setProductTopic(product.topic);
    setProductId(product._id);
  };

  const handleDelete = async (productId: string) => {
    try {
      await axios.delete(`${baseURL}/api/product/delete/${productId}`, {
        headers: { Authorization: "Bearer " + user?.token },
      });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleSearch = async () => {
    try {
      if (!search) {
        fetchProducts();
        return;
      }

      const response = await axios.post(
        `${baseURL}/api/product/search`,
        { name: search },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + user?.token,
          },
        }
      );

      setProducts(response.data.data);
    } catch (error) {
      console.error("Error searching product:", error);
    }
  };

  const selectPhotoTapped = () => {
    const options: ImageLibraryOptions = {
      mediaType: "photo",
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorMessage) {
        console.log("Image picker error: ", response.errorMessage);
      } else {
        let imageUri = response.assets?.[0]?.uri;
        if (imageUri) setImage(imageUri);
      }
    });
  };

  return (
    <View style={styles.container}>
      {user && user.user.role === "admin" && (
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
              <Text>Product Topic:</Text>
              <TextInput
                style={styles.input}
                onChangeText={setProductTopic}
                value={productTopic}
              />
            </View>
            <View style={styles.inputContainer}>
              <Button title="Select Image" onPress={selectPhotoTapped} />
            </View>
            {image && <Image style={styles.image} source={{ uri: image }} />}
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
              <Image source={{ uri: item.image }} style={styles.image} />
              <View>
                <Text>Name: {item.name}</Text>
                <Text>Price: {item.price}</Text>
                <Text>Topic: {item.topic}</Text>
              </View>
            </View>
            {user && user.user.role === "admin" && (
              <View style={styles.productButtons}>
                <Button onPress={() => handleEdit(item)} title="Edit" />
                <Button onPress={() => handleDelete(item._id)} title="Delete" />
              </View>
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
    marginVertical: 10,
  },
  productButtons: {
    width: 250,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  error: {
    color: "red",
    marginVertical: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    margin: 10,
  },
});
