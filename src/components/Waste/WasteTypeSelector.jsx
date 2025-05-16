import { useState, useEffect } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Checkbox, 
  ListItemText,
  FormHelperText
} from '@mui/material';

export default function WasteTypeSelector({ 
  value, 
  onChange, 
  error, 
  helperText, 
  label = "Tipos de Resíduos",
  multiple = true
}) {
  const [wasteTypes, setWasteTypes] = useState([]);
  
  // Fetch waste types from API
  useEffect(() => {
    const fetchWasteTypes = async () => {
      try {
        const response = await fetch('/api/waste');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.wasteTypes) {
            setWasteTypes(data.wasteTypes);
          }
        } else {
          console.error('Failed to fetch waste types');
        }
      } catch (error) {
        console.error('Error fetching waste types:', error);
      }
    };
    
    fetchWasteTypes();
  }, []);

  return (
    <FormControl fullWidth error={error} sx={{ mb: error ? 1 : 2 }}>
      <InputLabel id="waste-type-label">{label}</InputLabel>
      <Select
        labelId="waste-type-label"
        multiple={multiple}
        value={value}
        onChange={onChange}
        renderValue={(selected) => {
          if (multiple) {
            return selected.join(', ');
          }
          const selectedWaste = wasteTypes.find(waste => waste._id === selected);
          return selectedWaste ? selectedWaste.type : '';
        }}
        label={label}
      >
        {wasteTypes.map((waste) => (
          <MenuItem key={waste._id} value={multiple ? waste.type : waste._id}>
            {multiple && <Checkbox checked={value.indexOf(waste.type) > -1} />}
            <ListItemText 
              primary={waste.type} 
              secondary={waste.description || ''} 
            />
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}