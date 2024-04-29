const updateFirst50IsFeatured = async (eventId: string) => {
  fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/images/updateIsFeatured`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventId,
    }),
  }).then((res) => res.json());
};

export default updateFirst50IsFeatured;
