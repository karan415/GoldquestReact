import React, { useState } from 'react';

const Invoice = () => {
  const [image, setImage] = useState({
    media_file: null,
    imageUrl: null, 
  });

  const handleChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    
    if (file) {
      const imageUrl = URL.createObjectURL(file); 
      setImage({
        media_file: file,
        imageUrl, 
      });
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
 
  };

  return (
    <>
       <form onSubmit={handleSubmit}>
          <input type="file" name="media_file" onChange={handleChange} />
          <button type="submit">Submit</button>
       </form>
       {image.imageUrl && <img src={image.imageUrl} alt="Selected" style={{ maxWidth: '200px', maxHeight: '200px' }} />}
    </>
  );
};

export default Invoice;
