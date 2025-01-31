import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import {Alert, Image, Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Camera} from 'react-native-vision-camera';
import type {Routes} from './Routes';

const ICON = require('../src/icons2.png');

type Props = NativeStackScreenProps<Routes, 'Splash'>;

export function Splash({ navigation }: Props) {
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermission = useCallback(async () => {
    try {
      const result = await Camera.requestCameraPermission();
      if (result === 'authorized') {
        setHasPermission(true);
      } else {
        await Linking.openSettings();
      }
    } catch (e) {
      Alert.alert(
        'Failed to request permission!',
        'Failed to request Camera permission. Please verify that you have granted Camera Permission in your Settings app.',
      );
      await Linking.openSettings();
    }
  }, []);

  useEffect(() => {
    if (hasPermission) {
      navigation.navigate('App');
    }
  }, [hasPermission, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Welcome to Signalor.</Text>

      <Text style={styles.permissionText}>
        Signalor needs {'\n'} <Text style={styles.bold}>Camera permission.</Text>{' '}
        <TouchableOpacity onPress={requestPermission}>
          <Text style={styles.hyperlink}>Grant</Text>
        </TouchableOpacity>
      </Text>

      <Image source={ICON} style={styles.backgroundImage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 20, // Ensures left padding
      paddingTop: 60, // Pushes content to the top
      alignItems: 'flex-start', // Left-align all content
    },
    header: {
      fontSize: 38,
      fontWeight: 'bold',
      color: '#000',
      textAlign: 'left', // Ensure text is left-aligned
    },
    permissionsContainer: {
      marginTop: 20, // Space between the header and permission text
    },
    permissionText: {
      fontSize: 18,
      color: '#000',
      textAlign: 'left', // Force left alignment
    },
    bold: {
      fontWeight: 'bold',
    },
    hyperlink: {
      color: '#007AFF',
      fontWeight: '600',
    },
    backgroundImage: {
      position: 'absolute',
      bottom: 20,
      width: 256,
      height: 256,
      opacity: 0.4,
      left: -70, // Keeps the image on the left
    },
  });
