

'use client'; 

import { motion, MotionProps } from 'framer-motion';
import React from 'react';


type MotionWrapperProps = React.PropsWithChildren<
  MotionProps & React.HTMLAttributes<HTMLDivElement>
>;


export default function MotionWrapper(props: MotionWrapperProps) {
  
  const { children, ...rest } = props;
  
 
  return <motion.div {...rest}>{children}</motion.div>;
}