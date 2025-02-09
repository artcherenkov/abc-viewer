export const getNameInitials = (name?: string | null) => {
  if (!name) return "";

  const [firstName, lastName] = name.split(" ");
  return `${firstName[0]}${lastName ? lastName[0] : ""}`;
};
