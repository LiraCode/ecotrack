'use client';

import { useState, useEffect } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Checkbox, 
  ListItemText,
  FormHelperText,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import { getAllWasteTypes } from '@/services/wasteService';

export default function WasteTypeSelector({ 
  value, 
  onChange, 
  error, 
  helperText,
  label = "Tipos de Resíduos",
  multiple = true
}) {
  const [wasteTypes, setWasteTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchWasteTypes = async () => {
      setLoading(true);
      try {
        const result = await getAllWasteTypes();
        if (result.success) {
          setWasteTypes(result.wasteTypes);
        } else {
          setFetchError(result.error || 'Erro ao carregar tipos de resíduos');
        }
      } catch (error) {
        console.error('Error fetching waste types:', error);
        setFetchError('Erro ao carregar tipos de resíduos');
      } finally {
        setLoading(false);
      }
    };

    fetchWasteTypes();
  }, []);

  // Get display value for selected items
  const getDisplayValue = (selected) => {
    if (!selected || (Array.isArray(selected) && selected.length === 0)) {
      return '';
    }
    
    if (multiple) {
      return selected.map(id => {
        const waste = wasteTypes.find(w => w._id === id);
        return waste ? waste.type : '';
      }).filter(Boolean).join(', ');
    } else {
      const waste = wasteTypes.find(w => w._id === selected);
      return waste ? waste.type : '';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={20} color="success" />
        <Typography variant="body2" color="text.secondary">
          Carregando tipos de resíduos...
        </Typography>
      </Box>
    );
  }

  if (fetchError) {
    return (
      <Typography variant="body2" color="error">
        {fetchError}
      </Typography>
    );
  }

  return (
    <FormControl fullWidth error={!!error}>
      <InputLabel id="waste-type-selector-label">{label}</InputLabel>
      <Select
        labelId="waste-type-selector-label"
        multiple={multiple}
        value={value || (multiple ? [] : '')}
        onChange={onChange}
        renderValue={getDisplayValue}
        label={label}
      >
        {wasteTypes.map((waste) => (
          <MenuItem key={waste._id} value={waste._id}>
            {multiple && <Checkbox checked={Array.isArray(value) && value.indexOf(waste._id) > -1} />}
            <ListItemText 
              primary={waste.type} 
              secondary={waste.description && waste.description.length > 50 
                ? `${waste.description.substring(0, 50)}...` 
                : waste.description} 
            />
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}