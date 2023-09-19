import React from "react";
import styled from "styled-components";
import { InfoBox } from "src/components/InfoBox";
import { BodyCaps, BodyXS, LinksButtonText, TextNudge } from "../Typography";
import { TokenLogo } from "../TokenLogo";
import { FC } from "src/types";
import { Token } from "@beanstalk/sdk";
import { useTokenBalance } from "src/tokens/useTokenBalance";
import { size } from "src/breakpoints";
import { useSiloBalance } from "src/tokens/useSiloBalance";

type Props = {
  lpToken: Token;
};

export const LiquidityBox: FC<Props> = ({ lpToken }) => {
  const { data: balance } = useTokenBalance(lpToken);
  const { data: siloBalance } = useSiloBalance(lpToken);

  return (
    <InfoBox>
      <InfoBox.Header>
        <TextNudge amount={0} mobileAmount={2}>
          <BoxHeader>My Liquidity</BoxHeader>
        </TextNudge>
        <BoxHeaderAmount>
          <TokenLogo token={lpToken} size={16} mobileSize={16} isLP />
          <TextNudge amount={1.5}>{balance ? balance[lpToken.symbol].toHuman("short") : "-"}</TextNudge>
        </BoxHeaderAmount>
      </InfoBox.Header>
      <InfoBox.Body>
        <InfoBox.Row>
          <InfoBox.Key>In my Wallet</InfoBox.Key>
          <InfoBox.Value>{balance ? balance[lpToken.symbol].toHuman("short") : "-"}</InfoBox.Value>
        </InfoBox.Row>
        <InfoBox.Row>
          <InfoBox.Key>Deposited in the Silo</InfoBox.Key>
          <InfoBox.Value>{siloBalance ? siloBalance.toHuman("short") : "-"}</InfoBox.Value>
        </InfoBox.Row>
      </InfoBox.Body>
    </InfoBox>
  );
};

const BoxHeader = styled.div`
  ${BodyCaps}
  @media (max-width: ${size.mobile}) {
    ${BodyXS}
  }
`;
const BoxHeaderAmount = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  ${LinksButtonText}
`;
