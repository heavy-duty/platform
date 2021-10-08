pub fn parse_string(string: String) -> [u8; 32] {
  let src = string.as_bytes();
  let mut data = [0u8; 32];
  data[..src.len()].copy_from_slice(src);
  return data;
}
