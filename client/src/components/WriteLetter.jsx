function WriteLetter({ value, setValue }) {
  return (
    <div className="editor-card">
      <textarea
        className="letter-input"
        placeholder="Write your secret message here..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={3000}
      />

      <div className="character-count">
        {value.length}/3000
      </div>
    </div>
  );
}

export default WriteLetter;