// import React from 'react';
// import Reanimated, {
//   useAnimatedProps,
//   useAnimatedStyle,
// } from 'react-native-reanimated';
// import AnimateableText from 'react-native-animateable-text';
// import {StyleSheet, Text, ViewStyle} from 'react-native';
// import {useAnimatedColor} from '../utils/useAnimatedColor';

// type ColorTileProps = {
//   name: string;
//   color: Reanimated.SharedValue<string>;
//   percentage: number; // Add percentage prop
//   animationDuration: number;
//   animatedStyle?: ViewStyle;
// };

// const ColorTile = ({
//   name,
//   color,
//   animationDuration,
//   animatedStyle,
// }: ColorTileProps) => {
//   const animatedColor = useAnimatedColor(color, animationDuration);
//   const animatedBackgroundStyle = useAnimatedStyle(
//     () => ({
//       backgroundColor: animatedColor.value,
//     }),
//     [animatedColor],
//   );

//   const animatedProps = useAnimatedProps(
//     () => ({
//       text: color.value,
//     }),
//     [color],
//   );

//   return (
//     <Reanimated.View
//       style={[styles.tile, animatedBackgroundStyle, animatedStyle]}>
//       <Text style={styles.text}>{name}</Text>
//       <AnimateableText
//         animatedProps={animatedProps}
//         style={[styles.text, styles.smallerText]}
//       />
//     </Reanimated.View>
//   );
// };

// const styles = StyleSheet.create({
//   tile: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 3,
//   },
//   text: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     textShadowColor: 'black',
//     textShadowOffset: {
//       height: 0,
//       width: 0,
//     },
//     textShadowRadius: 2,
//     color: 'white',
//   },
//   smallerText: {
//     fontSize: 12,
//   },
// });

// export default React.memo(ColorTile);

// const ColorTile = ({
//   name,
//   color,
//   percentage, // Use percentage prop
//   animationDuration,
//   animatedStyle,
// }: ColorTileProps) => {
//   const animatedColor = useAnimatedColor(color, animationDuration);
//   const animatedBackgroundStyle = useAnimatedStyle(
//     () => ({
//       backgroundColor: animatedColor.value,
//     }),
//     [animatedColor],
//   );

//   const animatedProps = useAnimatedProps(
//     () => ({
//       text: color.value,
//     }),
//     [color],
//   );

//   return (
//     <Reanimated.View
//       style={[styles.tile, animatedBackgroundStyle, animatedStyle]}>
//       <Text style={styles.text}>{name}</Text>
//       <AnimateableText
//         animatedProps={animatedProps}
//         style={[styles.text, styles.smallerText]}
//       />
//       {/* Display percentage */}
//       <Text style={[styles.text, styles.percentageText]}>
//         {percentage}%
//       </Text>
//     </Reanimated.View>
//   );
// };

// const styles = StyleSheet.create({
//   tile: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 3,
//   },
//   text: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     textShadowColor: 'black',
//     textShadowOffset: {
//       height: 0,
//       width: 0,
//     },
//     textShadowRadius: 2,
//     color: 'white',
//   },
//   smallerText: {
//     fontSize: 12,
//   },
//   percentageText: {
//     marginTop: 5,
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: 'white',
//   },
// });

// export default React.memo(ColorTile);

import React from 'react';
import Reanimated, {
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';
import AnimateableText from 'react-native-animateable-text';
import {StyleSheet, Text, ViewStyle} from 'react-native';
import {useAnimatedColor} from '../utils/useAnimatedColor';

type ColorTileProps = {
  name: string;
  color: Reanimated.SharedValue<string>; // Shared value for color
  percentage: Reanimated.SharedValue<number>; // Shared value for percentage
  animationDuration: number;
  animatedStyle?: ViewStyle;
};

const ColorTile = ({
  name,
  color,
  percentage,
  animationDuration,
  animatedStyle,
}: ColorTileProps) => {
  // Animate the background color dynamically
  const animatedColor = useAnimatedColor(color, animationDuration);
  const animatedBackgroundStyle = useAnimatedStyle(
    () => ({
      backgroundColor: animatedColor.value,
    }),
    [animatedColor],
  );

  // Animated props for the color code
  const animatedColorProps = useAnimatedProps(() => ({
    text: color.value, // Bind to the color shared value
  }));

  // Animated props for the percentage
  const animatedPercentageProps = useAnimatedProps(() => ({
    text: `${percentage.value.toFixed(2)}%`, // Bind to the percentage shared value
  }));

  return (
    <Reanimated.View
      style={[styles.tile, animatedBackgroundStyle, animatedStyle]}>
      <Text style={styles.text}>{name}</Text>
      {/* Display the color code dynamically */}
      <AnimateableText
        animatedProps={animatedColorProps}
        style={[styles.text, styles.smallerText]}
      />
      {/* Display the percentage dynamically */}
      <AnimateableText
        animatedProps={animatedPercentageProps}
        style={[styles.text, styles.percentageText]}
      />
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'black',
    textShadowOffset: {
      height: 0,
      width: 0,
    },
    textShadowRadius: 2,
    color: 'white',
  },
  smallerText: {
    fontSize: 12,
  },
  percentageText: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default React.memo(ColorTile);