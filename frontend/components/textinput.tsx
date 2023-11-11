import styled from "styled-components";

const Container = styled.div`
  position: relative;
  width: 100%;
  z-index: 5;
  input {
    width: 100%;
    border: 0px;
    padding: 10px 15px;
    line-height: 1.5em;
    margin: 0;
    border-radius: 8px;
    -webkit-appearance: none;
    outline: none;
    background: white;
  }
`;

interface Props {
  value: string;
  onChangeHandler: (newVal: string) => void;
  placeholder: string;
}

export const TextInput = ({ value, onChangeHandler, placeholder }: Props) => {
  return (
    <Container className="w-full relative">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(evt) => onChangeHandler(evt.target.value)}
      />
    </Container>
  );
};
