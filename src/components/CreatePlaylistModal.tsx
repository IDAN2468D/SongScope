import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';

type CreatePlaylistModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
};

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ visible, onClose, onCreate }) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreate = () => {
    if (newPlaylistName.trim() === '') {
      Alert.alert('שגיאה', 'שם הפלייליסט לא יכול להיות ריק.');
      return;
    }
    onCreate(newPlaylistName);
    setNewPlaylistName('');
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>צור פלייליסט חדש</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="שם הפלייליסט"
            placeholderTextColor="#B0B0B0"
            value={newPlaylistName}
            onChangeText={setNewPlaylistName}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.buttonCancel]}
              onPress={onClose}
            >
              <Text style={styles.textStyle}>ביטול</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.buttonCreate]}
              onPress={handleCreate}
            >
              <Text style={styles.textStyle}>צור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  modalInput: {
    backgroundColor: '#282828',
    borderRadius: 10,
    padding: 10,
    width: 250,
    marginBottom: 15,
    color: '#E0E0E0',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonCancel: {
    backgroundColor: '#FF6347',
  },
  buttonCreate: {
    backgroundColor: '#1DB954',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default CreatePlaylistModal;
