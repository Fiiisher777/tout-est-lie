import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { defaultPlayer, playerReducer, type PlayerAction, type PlayerState } from './player';
import { loadPlayer, savePlayer } from './storage';
type PlayerContext = {
    state: PlayerState;
    ready: boolean;
    issue: 'read' | 'write' | 'recovered' | 'futureVersion' | null;
    writable: boolean;
    update: (action: Exclude<PlayerAction, {
        type: 'hydrate';
    }>) => Promise<void>;
    retry: () => Promise<void>;
};
const Context = createContext<PlayerContext | null>(null);
export function PlayerProvider({ children }: {
    children: ReactNode;
}) {
    const [state, dispatch] = useReducer(playerReducer, undefined, defaultPlayer);
    const current = useRef(state);
    const [ready, setReady] = useState(false);
    const [writable, setWritable] = useState(false);
    const [issue, setIssue] = useState<PlayerContext['issue']>(null);
    const writing = useRef(0);
    const hydrate = useCallback(() => loadPlayer().then(loaded => {
        current.current = loaded.state;
        dispatch({ type: 'hydrate', state: loaded.state });
        setIssue(loaded.warning);
        setWritable(loaded.writable);
    }).catch(() => {
        setIssue('read');
    }).finally(() => {
        setReady(true);
    }), []);
    useEffect(() => { void hydrate(); }, [hydrate]);
    const update = useCallback(async (action: Exclude<PlayerAction, {
        type: 'hydrate';
    }>) => {
        if (!ready || !writable)
            throw new Error('Storage is not ready');
        const next = playerReducer(current.current, action);
        current.current = next;
        dispatch(action);
        const revision = ++writing.current;
        try {
            await savePlayer(next);
            if (revision === writing.current)
                setIssue(null);
        }
        catch (error) {
            setIssue('write');
            throw error;
        }
    }, [ready, writable]);
    const retry = useCallback(async () => {
        if (!writable) {
            setReady(false);
            return hydrate();
        }
        try {
            await savePlayer(current.current);
            setIssue(null);
        }
        catch {
            setIssue('write');
        }
    }, [hydrate, writable]);
    return <Context.Provider value={{ state, ready, writable, issue, update, retry }}>{children}</Context.Provider>;
}
export function usePlayer() {
    const context = useContext(Context);
    if (!context)
        throw new Error('PlayerProvider is required');
    return context;
}
