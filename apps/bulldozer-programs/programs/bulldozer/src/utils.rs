pub fn vectorize_string(string: String, length: usize) -> Vec<u8> {
  let mut vector = Vec::new();

  for (i, letter) in string.as_bytes().iter().enumerate() {
      vector.push(*letter);

      if i == length - 1 {
        return vector;
      }
  }

  return vector;
}
