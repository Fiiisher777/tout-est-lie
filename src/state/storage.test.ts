import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadPlayer, savePlayer } from './storage';
import { defaultPlayer } from './player';
jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true, default: { getItem: jest.fn(), setItem: jest.fn() },
}));
beforeEach(() => jest.clearAllMocks());
test('read failures propagate instead of replacing a save with defaults', async () => {
    jest.mocked(AsyncStorage.getItem).mockRejectedValueOnce(new Error('disk'));
    await expect(loadPlayer()).rejects.toThrow('disk');
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
});
test('writes remain ordered and recover after a failed write', async () => {
    const writes = jest.mocked(AsyncStorage.setItem);
    writes.mockRejectedValueOnce(new Error('disk')).mockResolvedValueOnce();
    const first = savePlayer(defaultPlayer());
    const secondState = { ...defaultPlayer(), completedLevels: ['level-1'] };
    const second = savePlayer(secondState);
    await expect(first).rejects.toThrow('disk');
    await expect(second).resolves.toBeUndefined();
    expect(JSON.parse(writes.mock.calls[1][1])).toEqual(secondState);
});
