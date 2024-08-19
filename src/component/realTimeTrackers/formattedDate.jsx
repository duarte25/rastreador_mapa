import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR'; // Importar locale para português

const FormattedDate = ({ date, fallbackText }) => {
  if (!date) return <span>{fallbackText || 'Data não disponível'}</span>;

  try {
    const dateObj = new Date(date);
    const formattedDate = format(dateObj, "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    return <span>{formattedDate}</span>;
  } catch (error) {
    return <span>{fallbackText || 'Formato de data inválido'}</span>;
  }
};

FormattedDate.propTypes = {
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
  fallbackText: PropTypes.string
};

export default FormattedDate;
