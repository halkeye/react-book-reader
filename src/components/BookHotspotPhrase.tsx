import React, { useState, CSSProperties } from 'react';
import { motion } from 'framer-motion';

interface Props extends CSSProperties {
  phrase: string;
  x: number;
  y: number;
}

const BookHotspotPhrase: React.FC<Props> = ({
  phrase,
  x,
  y,
  ...styleProps
}) => {
  const [display, setDisplay] = useState<string>('none');

  // const triggerAnimation = () => {
  //   setDisplay('block');
  // };
  //
  const onComplete = () => {
    setDisplay('none');
  };

  const style: CSSProperties = {
    position: 'absolute',
    display: display,
    top: y,
    left: x,
    textShadow: '2px 2px 2px gray',
    ...styleProps,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
      onAnimationComplete={onComplete}
    >
      <div style={style}>{phrase}</div>
    </motion.div>
  );
};

export default BookHotspotPhrase;
