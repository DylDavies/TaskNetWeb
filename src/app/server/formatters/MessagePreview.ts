const truncateText = (text: string) => {
    if (!text) return '';

    return text.length > 30 
      ? `${text.substring(0, 30)}...` 
      : text;
}

export { truncateText }