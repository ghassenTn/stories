import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  FlatList,
  ViewStyle,
  TextStyle
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface PickerItem {
  label: string;
  value: string;
}

interface PickerProps {
  label?: string;
  items: PickerItem[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  error?: string;
}

export default function Picker({
  label,
  items,
  selectedValue,
  onValueChange,
  placeholder = 'اختر...',
  containerStyle,
  labelStyle,
  error,
}: PickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedItem = items.find(item => item.value === selectedValue);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      
      <TouchableOpacity
        style={[styles.pickerButton, error && styles.pickerButtonError]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <ChevronDown size={18} color={Colors.gray[500]} style={styles.icon} />
        <Text style={[
          styles.pickerText,
          !selectedItem && styles.placeholderText
        ]}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'اختر'}</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeButton}>إغلاق</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.item,
                    selectedValue === item.value && styles.selectedItem
                  ]}
                  onPress={() => {
                    onValueChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.itemText,
                    selectedValue === item.value && styles.selectedItemText
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.list}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: Colors.dark,
    textAlign: 'right',
  },
  pickerButton: {
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonError: {
    borderColor: Colors.error,
  },
  pickerText: {
    fontSize: 14,
    color: Colors.dark,
    textAlign: 'right',
    flex: 1,
  },
  placeholderText: {
    color: Colors.gray[500],
  },
  icon: {
    marginLeft: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  closeButton: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  list: {
    maxHeight: '100%',
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  selectedItem: {
    backgroundColor: Colors.gray[100],
  },
  itemText: {
    fontSize: 14,
    color: Colors.dark,
    textAlign: 'right',
  },
  selectedItemText: {
    fontWeight: '500',
    color: Colors.primary,
  },
});