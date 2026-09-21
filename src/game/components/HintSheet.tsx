import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../../components/AppText';
import { puzzleTheme as theme } from '../../config/theme';
import { useTranslation } from '../../i18n';
export function HintSheet({visible,available,onChoose,onClose}:{visible:boolean;available:readonly ('pair'|'category')[];onChoose:(kind:'pair'|'category')=>void;onClose:()=>void}) {
  const {t}=useTranslation();
  if(!visible)return null;
  return <Modal transparent animationType="none" visible onRequestClose={onClose}>
    <SafeAreaView style={styles.backdrop}><View style={styles.sheet} accessibilityViewIsModal>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="subtitle">{t('hint')}</AppText>
        {(['pair','category'] as const).map(kind=><Pressable key={kind} testID={`hint-${kind}`} accessibilityRole="button" accessibilityState={{disabled:!available.includes(kind)}} disabled={!available.includes(kind)}
          onPress={()=>onChoose(kind)} style={[styles.choice,!available.includes(kind)&&styles.disabled]}>
          <AppText style={styles.title}>{t(kind==='pair'?'hintPairTitle':'hintCategoryTitle')}</AppText>
          <AppText style={styles.description}>{t(kind==='pair'?'hintPairDescription':'hintCategoryDescription')}</AppText>
        </Pressable>)}
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.close}><AppText>{t('cancel')}</AppText></Pressable>
      </ScrollView>
    </View></SafeAreaView>
  </Modal>;
}
const styles=StyleSheet.create({backdrop:{flex:1,justifyContent:'flex-end',backgroundColor:theme.background},sheet:{maxHeight:'85%',backgroundColor:theme.surface,borderTopLeftRadius:20,borderTopRightRadius:20},content:{padding:20,gap:12},choice:{minHeight:theme.tapTarget,padding:14,borderWidth:1,borderColor:theme.border,borderRadius:theme.radius.panel},title:{color:theme.textPrimary,fontSize:17,fontWeight:'600'},description:{color:theme.textSecondary,fontSize:14,lineHeight:22},disabled:{opacity:0.5},close:{minHeight:theme.tapTarget,alignItems:'center',justifyContent:'center'}});
