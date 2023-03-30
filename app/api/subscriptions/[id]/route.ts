import { StatusCodes } from "http-status-codes";
import { prismaClient } from "lib/server/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { inngest } from "pages/api/inngest";
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(undefined, {
      status: StatusCodes.UNAUTHORIZED,
    });
  }

  const subscriptionId = params.id;
  if (!subscriptionId) {
    return new Response(undefined, {
      status: StatusCodes.BAD_REQUEST,
    });
  }

  const subscription = await prismaClient.subscription.findUnique({
    where: {
      id: subscriptionId,
    },
  });

  if (!subscription) {
    return new Response(undefined, {
      status: StatusCodes.NOT_FOUND,
    });
  }

  if (subscription.userId !== session.user.id) {
    return new Response(undefined, {
      status: StatusCodes.FORBIDDEN,
    });
  }

  await inngest.send({
    name: "cancel",
    data: {
      subscriptionId: subscription.id,
    },
  });

  await prismaClient.subscription.delete({
    where: {
      id: subscriptionId,
    },
  });

  return new Response(undefined, {
    status: StatusCodes.NO_CONTENT,
  });
}
