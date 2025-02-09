import { Loader } from "lucide-react";
import React from "react";
import colors from "tailwindcss/colors";

const Spinner = () => {
  return (
    <Loader
      className="animate-[spin_2s_linear_infinite]"
      color={colors.zinc["300"]}
      size={28}
    />
  );
};

export default Spinner;
