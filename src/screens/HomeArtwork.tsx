import { useState } from 'react';
import { Image, StyleSheet, View, useWindowDimensions, type ImageRequireSource } from 'react-native';

// Decorative art uses only leftover space, never adds scroll height or covers controls.
export function professorLayout(width: number, availableHeight: number, fontScale: number) {
  if(width<350 || availableHeight<150 || fontScale>1.3)return null;
  const height=Math.min(availableHeight+20,280)*1.85;
  // Preserve the supplied 1086:1448 canvas and compensate its transparent right margin.
  const imageWidth=height*(1086/1448);
  return {height,width:imageWidth,right:-12-imageWidth*0.06,bottom:availableHeight-height};
}
export function HomeProfessor({source}:{source:ImageRequireSource}) {
  const {width,fontScale}=useWindowDimensions();const [height,setHeight]=useState(0);
  const layout=professorLayout(width,height,fontScale);
  return <View testID="professor-space" pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={styles.space} onLayout={event=>setHeight(event.nativeEvent.layout.height)}>
    {layout&&<Image testID="professor-illustration" source={source} resizeMode="contain" accessible={false} style={[styles.art,layout]} />}
  </View>;
}
const styles=StyleSheet.create({
  space:{flexGrow:1,minHeight:0,overflow:'hidden',marginHorizontal:-24,marginBottom:-24},
  art:{position:'absolute',opacity:0.85},
});
