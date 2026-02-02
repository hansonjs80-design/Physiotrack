
import React, { useState } from 'react';
import { Preset } from '../types';
import { PresetList } from './settings/PresetList';
import { PresetEditor } from './settings/PresetEditor';

interface SettingsPresetTabProps {
  presets: Preset[];
  onUpdatePresets: (presets: Preset[]) => void;
}

export const SettingsPresetTab: React.FC<SettingsPresetTabProps> = ({ presets, onUpdatePresets }) => {
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);

  const handleSavePreset = (preset: Preset) => {
    const existingIndex = presets.findIndex(p => p.id === preset.id);
    if (existingIndex >= 0) {
      const newPresets = [...presets];
      newPresets[existingIndex] = preset;
      onUpdatePresets(newPresets);
    } else {
      onUpdatePresets([...presets, preset]);
    }
    setEditingPreset(null);
  };

  const handleDeletePreset = (id: string) => {
    onUpdatePresets(presets.filter(p => p.id !== id));
  };

  return (
    <>
      {editingPreset ? (
        <PresetEditor 
          initialPreset={editingPreset}
          onSave={handleSavePreset}
          onCancel={() => setEditingPreset(null)}
        />
      ) : (
        <PresetList 
          presets={presets}
          onEdit={setEditingPreset}
          onDelete={handleDeletePreset}
          onCreate={() => setEditingPreset({ id: crypto.randomUUID(), name: '새 처방', steps: [] })}
          onUpdatePresets={onUpdatePresets}
        />
      )}
    </>
  );
};
