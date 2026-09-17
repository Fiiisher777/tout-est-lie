import { useState } from 'react';
import { useTranslation } from '../i18n';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import type { GameViewProps } from './types';
export function GameView({ onComplete }: GameViewProps) {
    const { t } = useTranslation();
    const [busy, setBusy] = useState(false);
    return <>
    <AppText variant="subtitle">{t('placeholder')}</AppText>
    <AppText>{t('placeholderHelp')}</AppText>
    <Button disabled={busy} title={t(busy ? 'saving' : 'completeDemo')} onPress={() => {
            setBusy(true);
            void onComplete(0).finally(() => setBusy(false));
        }}/>
  </>;
}
