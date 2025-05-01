const truncateText = (text: string) => {
    if (!text) return '';

    return text.length > 35 
      ? `${text.substring(0, 35)}...` 
      : text;
}

export { truncateText }