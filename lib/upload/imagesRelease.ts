const imagesRelease = async (eventId: string) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  //把 isReleased 改成 true
  const response = await fetch(
    `${domain}/api/images/releaseByEventId/${eventId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).then((res) => res.json());

  return {
    status: response.status,
  };
};

export default imagesRelease;
