import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {AppState, Dimensions, Platform, StyleSheet, Text, View} from 'react-native';
import {
  Camera,
  CameraProps,
  CameraRuntimeError,
  FrameProcessorPerformanceSuggestion,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {getColorPalette} from './utils/getColorPalette';
import {hapticFeedback} from './utils/hapticFeedback';
import Reanimated, {
  interpolate,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  useWorkletCallback,
  withSpring,
} from 'react-native-reanimated';
import ColorTile from './components/ColorTile';
import {TapGestureHandler} from 'react-native-gesture-handler';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';
import {AnimatedStatusBar} from './components/AnimatedStatusBar';
import {BlurView} from '@react-native-community/blur';

const IS_IOS = Platform.OS === 'ios';
const BackgroundView = IS_IOS
  ? Reanimated.createAnimatedComponent(BlurView)
  : Reanimated.View;

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  isActive: true,
});

const SCREEN_WIDTH = Dimensions.get('window').width;
const SAFE_BOTTOM = StaticSafeAreaInsets.safeAreaInsetsBottom;

const DEFAULT_COLOR = '#000000';
const MAX_FRAME_PROCESSOR_FPS = 2;

const TILE_SIZE = SCREEN_WIDTH / 4;
const ACTIVE_TILE_HEIGHT = TILE_SIZE * 1.3 + SAFE_BOTTOM;
const ACTIVE_TILE_SCALE = 0.9;
const ACTIVE_CONTAINER_SCALE = 0.95;
const ACTIVE_CONTAINER_PADDING = TILE_SIZE - TILE_SIZE * ACTIVE_TILE_SCALE;
const TRANSLATE_Y_ACTIVE =
  (SCREEN_WIDTH - SCREEN_WIDTH * ACTIVE_CONTAINER_SCALE) / 2 + SAFE_BOTTOM;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    blackscreen: {
      flex: 1,
      backgroundColor: 'black',
    },
    camera: {
      flex: 1,
    },
    palettes: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      backgroundColor: IS_IOS ? 'transparent' : 'white',
    },
    // Add these styles
    headerTextContainer: {
      position: 'absolute',
      top: 20, // Adjust the margin from the top as needed
      left: 0,
      right: 0,
      alignItems: 'center', // Center horizontally
      zIndex: 1, // Ensure it is above other elements
    },
    headerText: {
      top: 20,
      fontSize: 16,
      fontWeight: '600',
      color: 'white',
      textAlign: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background for visibility
      paddingVertical: 15,
      paddingHorizontal: 15,
      borderRadius: 10, // Rounded corners
    },
  });

export function App() {
  const [frameProcessorFps, setFrameProcessorFps] = useState(3);
  const isPageActive = useSharedValue(true);
  const isHolding = useSharedValue(false);

  const colorAnimationDuration = useMemo(
    () => (1 / frameProcessorFps) * 1000,
    [frameProcessorFps],
  );

  const devices = useCameraDevices('wide-angle-camera');
  const device = devices.back;
  const primaryColor = useSharedValue(DEFAULT_COLOR);
  const secondaryColor = useSharedValue(DEFAULT_COLOR);
  const backgroundColor = useSharedValue(DEFAULT_COLOR);
  const detailColor = useSharedValue(DEFAULT_COLOR);

  const primaryPercentage = useSharedValue(0);
  const secondaryPercentage = useSharedValue(0);
  const backgroundPercentage = useSharedValue(0);
  const detailPercentage = useSharedValue(0);

  const onCameraError = useCallback((error: CameraRuntimeError) => {
    console.error(`${error.code}: ${error.message}`, error.cause);
  }, []);
  const onCameraInitialized = useCallback(() => {
    console.log('Camera initialized!');
  }, []);

  const isActiveAnimation = useDerivedValue(
    () =>
      withSpring(isHolding.value ? 0 : 1, {
        mass: 1,
        damping: 500,
        stiffness: 800,
        restDisplacementThreshold: 0.0001,
      }),
    [isHolding],
  );
  // const palettesStyle = useAnimatedStyle(
  //   () => ({
  //     transform: [
  //       {
  //         scale: interpolate(
  //           isActiveAnimation.value,
  //           [0, 1],
  //           [1, ACTIVE_CONTAINER_SCALE],
  //         ),
  //       },
  //       {
  //         translateY: interpolate(
  //           isActiveAnimation.value,
  //           [0, 1],
  //           [0, -TRANSLATE_Y_ACTIVE],
  //         ),
  //       },
  //     ],
  //     padding: interpolate(
  //       isActiveAnimation.value,
  //       [0, 1],
  //       [0, ACTIVE_CONTAINER_PADDING],
  //     ),
  //     borderRadius: interpolate(isActiveAnimation.value, [0, 1], [0, 25]),
  //   }),
  //   [isActiveAnimation],
  // );
  const palettesStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(isActiveAnimation.value, [0, 1], [1, 0.95]) },
    ],
    borderRadius: interpolate(isActiveAnimation.value, [0, 1], [0, 25]),
  }));
  
  const colorTileStyle = useAnimatedStyle(
    () => ({
      borderRadius: interpolate(isActiveAnimation.value, [0, 1], [0, 15]),
      transform: [
        {
          scale: interpolate(
            isActiveAnimation.value,
            [0, 1],
            [1, ACTIVE_TILE_SCALE],
          ),
        },
      ],
      width: TILE_SIZE,
      height: interpolate(
        isActiveAnimation.value,
        [0, 1],
        [ACTIVE_TILE_HEIGHT, TILE_SIZE],
      ),
      paddingBottom: interpolate(
        isActiveAnimation.value,
        [0, 1],
        [SAFE_BOTTOM, 0],
      ),
    }),
    [isActiveAnimation],
  );

  const frameProcessor = useFrameProcessor(
    (() => {
      let lastUpdateTime = 0;
      const debounceInterval = 200; // Update every 200ms (adjust as needed)
  
      return frame => {
        'worklet';
        const currentTime = Date.now();
        if (currentTime - lastUpdateTime < debounceInterval) return;
  
        lastUpdateTime = currentTime;
  
        const colors = getColorPalette(frame, 'lowest');
        if (!colors) return;
  
        const { primary, secondary, background, detail } = colors;
  
        primaryColor.value = primary.color || '#000000';
        primaryPercentage.value = primary.percentage || 0;
  
        secondaryColor.value = secondary.color || '#000000';
        secondaryPercentage.value = secondary.percentage || 0;
  
        backgroundColor.value = background.color || '#000000';
        backgroundPercentage.value = background.percentage || 0;
  
        detailColor.value = detail.color || '#000000';
        detailPercentage.value = detail.percentage || 0;
      };
    })(),
    [primaryColor, primaryPercentage, secondaryColor, secondaryPercentage, backgroundColor, backgroundPercentage, detailColor, detailPercentage],
  );

  const onTapBegin = useWorkletCallback(() => {
    isHolding.value = true;
    runOnJS(hapticFeedback)('selection');
  }, [isHolding]);
  const onTapEnd = useWorkletCallback(() => {
    isHolding.value = false;
  }, [isHolding]);

  const cameraAnimatedProps = useAnimatedProps<CameraProps>(
    () => ({
      isActive: !isHolding.value && isPageActive.value,
    }),
    [isHolding, isPageActive],
  );

  const onFrameProcessorPerformanceSuggestionAvailable = useCallback(
    ({suggestedFrameProcessorFps}: FrameProcessorPerformanceSuggestion) => {
      const newFps = Math.min(
        suggestedFrameProcessorFps,
        MAX_FRAME_PROCESSOR_FPS,
      );
      setFrameProcessorFps(newFps);
    },
    [],
  );

  useEffect(() => {
    const listener = AppState.addEventListener('change', state => {
      isPageActive.value = state === 'active';
    });
    return () => {
      listener.remove();
    };
  }, [isPageActive, isHolding]);

  if (device == null) {
    return <View style={styles.blackscreen} />;
  }

  console.log(`Camera Device: ${device.name}`);

  return (
    <TapGestureHandler
      onBegan={onTapBegin}
      onEnded={onTapEnd}
      onFailed={onTapEnd}
      enabled={true}
      minPointers={1}
      maxDurationMs={999999}>
      <Reanimated.View style={styles.container}>
        <Reanimated.View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>
            Point your camera and wait for 2 seconds for color identification to happen
          </Text>
        </Reanimated.View>
        <AnimatedStatusBar
          barStyle="light-content"
          animated={true}
          isHidden={isHolding}
        />
        <ReanimatedCamera
          device={device}
          isActive={true} // <-- overriden by animatedProps
          frameProcessor={frameProcessor}
          style={styles.camera}
          onError={onCameraError}
          onInitialized={onCameraInitialized}
          frameProcessorFps={frameProcessorFps}
          onFrameProcessorPerformanceSuggestionAvailable={
            onFrameProcessorPerformanceSuggestionAvailable
          }
          animatedProps={cameraAnimatedProps}
        />
        <BackgroundView style={[styles.palettes, palettesStyle]}>
          {[
            { name: 'Color 1', color: primaryColor, percentage: primaryPercentage },
            { name: 'Color 2', color: secondaryColor, percentage: secondaryPercentage },
            { name: 'Color 3', color: detailColor, percentage: detailPercentage },
            { name: 'Color 4', color: backgroundColor, percentage: backgroundPercentage },
          ]
            // Sort colors by percentage in descending order
            .sort((a, b) => b.percentage.value - a.percentage.value)
            // Ensure the labels stay consistent but align with the sorted data
            .map((item, index) => (
              <ColorTile
                key={index}
                name={`Color ${index + 1}`} // Ensures the name stays consistent
                color={item.color} // Sorted color
                percentage={item.percentage} // Sorted percentage
                animationDuration={colorAnimationDuration}
                animatedStyle={colorTileStyle}
              />
            ))}
        </BackgroundView>
      </Reanimated.View>
    </TapGestureHandler>
  );
}
