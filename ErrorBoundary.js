import React from "react";
import Image from "next/image";
import wentWrongImage from "/public/images/SomethingWentWrong.webp";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      info: null,
    };
  }
  componentDidCatch(error, info) {
    this.setState({
      hasError: true,
      error: error,
      info: info,
    });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center">
          <Image src={wentWrongImage} alt={"Error page"} />
        </div>
      );
    }
    return this.props.children;
  }
}
