"use client";

import { Song } from "@/types";

interface SongItemProps {
  data: Song;
  onClick: (id: string) => void;
}

const SongItem: React.FC<SongItemProps> = ({ data, onClick }) => {
  return (
    <>
      <div>Songs Item</div>
    </>
  );
};

export default SongItem;
